#!/usr/bin/env python
# -*- coding: utf-8 -*-
import requests
import json

BASE_URL = 'http://localhost:5000'

def test_create_room():
    """测试创建房间和获取元素显示"""
    print("=" * 60)
    print("测试1：创建房间和检查手牌显示")
    print("=" * 60)
    
    response = requests.post(f'{BASE_URL}/api/game/create', json={
        'playerName': '测试玩家1'
    })
    
    if response.status_code != 200:
        print(f"创建房间失败: {response.status_code}")
        return None
    
    data = response.json()
    room_code = data.get('roomCode')
    player_id_1 = data.get('playerId')
    game_state = data.get('gameState', {})
    
    print(f"✓ 房间创建成功")
    print(f"  房间号: {room_code}")
    print(f"  玩家1 ID: {player_id_1} (类型: {type(player_id_1).__name__})")
    
    if game_state.get('players'):
        player1 = game_state['players'][0]
        hand = player1.get('hand', [])
        has_unknown = 'unknown' in hand
        has_real_elements = any(h in ["H", "O", "C", "N", "F", "Na", "Mg"] for h in hand)
        
        print(f"  玩家1手牌前5张: {hand[:5]}")
        print(f"  手牌中有'unknown': {has_unknown}")
        print(f"  手牌中有真实元素: {has_real_elements}")
        
        if has_real_elements and not has_unknown:
            print("  ✓ 手牌显示正确（全是元素符号）")
        else:
            print("  ✗ 手牌显示有问题")
    
    return room_code, player_id_1

def test_join_room(room_code):
    """测试加入房间"""
    print("\n" + "=" * 60)
    print("测试2：加入房间和检查手牌隐藏")
    print("=" * 60)
    
    response = requests.post(f'{BASE_URL}/api/game/join', json={
        'roomCode': room_code,
        'playerName': '测试玩家2',
        'asSpectator': False
    })
    
    if response.status_code != 200:
        print(f"加入房间失败: {response.status_code}")
        print(response.json())
        return None
    
    data = response.json()
    player_id_2 = data.get('playerId')
    
    print(f"✓ 玩家2加入成功")
    print(f"  玩家2 ID: {player_id_2} (类型: {type(player_id_2).__name__})")
    
    return player_id_2

def test_get_game_state(room_code, player_id):
    """测试获取游戏状态"""
    print("\n" + "=" * 60)
    print(f"测试3：获取游戏状态（作为玩家{player_id}）")
    print("=" * 60)
    
    response = requests.get(f'{BASE_URL}/api/game/{room_code}/{player_id}')
    
    if response.status_code != 200:
        print(f"获取游戏状态失败: {response.status_code}")
        return
    
    data = response.json()
    game_state = data.get('gameState', {})
    players = game_state.get('players', [])
    
    print(f"✓ 成功获取游戏状态")
    print(f"  房间号: {game_state.get('roomCode')}")
    print(f"  玩家数: {game_state.get('playerCount')}")
    
    for player in players:
        p_id = player.get('id')
        name = player.get('name')
        hand = player.get('hand', [])
        is_current = p_id == player_id
        
        has_unknown = 'unknown' in hand
        has_real = any(h in ["H", "O", "C", "N", "F"] for h in hand)
        
        marker = "→ 当前玩家" if is_current else "  其他玩家"
        print(f"\n  {marker} (ID={p_id}):")
        print(f"    名字: {name}")
        print(f"    手牌前5张: {hand[:5]}")
        
        if is_current:
            if has_real and not has_unknown:
                print(f"    ✓ 显示自己的真实手牌")
            else:
                print(f"    ✗ 手牌显示错误")
        else:
            if has_unknown and not has_real:
                print(f"    ✓ 隐藏了其他玩家的手牌")
            else:
                print(f"    ✗ 没有正确隐藏手牌")

def test_elements_api():
    """测试元素列表API"""
    print("\n" + "=" * 60)
    print("测试4：获取db.json元素列表API")
    print("=" * 60)
    
    response = requests.get(f'{BASE_URL}/api/elements')
    
    if response.status_code != 200:
        print(f"获取元素列表失败: {response.status_code}")
        return
    
    data = response.json()
    elements = data.get('elements', [])
    
    print(f"✓ 成功获取元素列表")
    print(f"  元素数量: {len(elements)}")
    print(f"  元素列表: {elements}")

def test_compounds_api():
    """测试化合物选择API"""
    print("\n" + "=" * 60)
    print("测试5：化合物选择API")
    print("=" * 60)
    
    test_cases = [
        (['H', 'O'], 'H和O'),
        (['C', 'O'], 'C和O'),
        (['Na', 'Cl'], 'Na和Cl'),
    ]
    
    for elements, desc in test_cases:
        response = requests.post(f'{BASE_URL}/api/compounds', json={
            'elements': elements
        })
        
        if response.status_code != 200:
            print(f"  ✗ {desc}失败: {response.status_code}")
            continue
        
        compounds = response.json().get('compounds', [])
        print(f"  ✓ {desc} -> {len(compounds)}个化合物")
        if compounds:
            print(f"    示例: {compounds[:3]}")

if __name__ == '__main__':
    try:
        result = test_create_room()
        if result:
            room_code, player_id_1 = result
            player_id_2 = test_join_room(room_code)
            
            if player_id_2:
                test_get_game_state(room_code, player_id_1)
                test_get_game_state(room_code, player_id_2)
        
        test_elements_api()
        test_compounds_api()
        
        print("\n" + "=" * 60)
        print("测试完成！")
        print("=" * 60)
        
    except Exception as e:
        print(f"错误: {e}")
        import traceback
        traceback.print_exc()
