#!/usr/bin/env python
# -*- coding: utf-8 -*-
import requests
import json

BASE_URL = 'http://localhost:5000'

def test_full_game_flow():
    """完整游戏流程测试"""
    print("=" * 60)
    print("完整游戏流程测试")
    print("=" * 60)
    
    # 1. 创建房间
    print("\n1. 创建房间...")
    response = requests.post(f'{BASE_URL}/api/game/create', json={
        'playerName': '玩家1'
    })
    data = response.json()
    room_code = data.get('roomCode')
    player_id_1 = 0
    print(f"   房间号: {room_code}")
    
    # 2. 加入房间
    print("\n2. 加入房间...")
    response = requests.post(f'{BASE_URL}/api/game/join', json={
        'roomCode': room_code,
        'playerName': '玩家2',
        'asSpectator': False
    })
    player_id_2 = response.json().get('playerId')
    print(f"   玩家2 ID: {player_id_2}")
    
    # 3. 开始游戏
    print("\n3. 开始游戏...")
    response = requests.post(f'{BASE_URL}/api/game/{room_code}/start', json={
        'playerId': player_id_1
    })
    if response.status_code != 200:
        print(f"   ✗ 游戏启动失败: {response.status_code}")
        print(f"   {response.json()}")
        return
    
    print(f"   ✓ 游戏已启动")
    
    # 4. 获取游戏状态 - 作为玩家1
    print("\n4. 检查玩家1的手牌...")
    response = requests.get(f'{BASE_URL}/api/game/{room_code}/{player_id_1}')
    if response.status_code != 200:
        print(f"   ✗ 获取状态失败: {response.status_code}")
        return
    
    data = response.json()
    game_state = data.get('gameState', {})
    players = game_state.get('players', [])
    
    for player in players:
        p_id = player.get('id')
        name = player.get('name')
        hand = player.get('hand', [])
        is_current = p_id == player_id_1
        
        if is_current:
            print(f"   玩家{p_id} ({name}):")
            print(f"     手牌数: {len(hand)}")
            print(f"     手牌: {hand}")
            
            # 检查手牌内容
            has_unknown = 'unknown' in hand
            has_real = any(h in ["H", "O", "C", "N", "F", "Na", "Mg", "Al"] for h in hand)
            has_empty = '' in hand or None in hand
            
            print(f"     含有'unknown': {has_unknown}")
            print(f"     含有真实元素: {has_real}")
            print(f"     含有空值: {has_empty}")
            
            if has_real and not has_unknown and not has_empty:
                print(f"     ✓ 手牌显示正确！")
            else:
                print(f"     ✗ 手牌显示有问题")
        else:
            print(f"   玩家{p_id} ({name}) - 其他玩家:")
            print(f"     手牌数: {len(hand)}")
            print(f"     前5张: {hand[:5]}")
            
            has_unknown = 'unknown' in hand
            has_real = any(h in ["H", "O", "C", "N", "F"] for h in hand)
            
            if has_unknown and not has_real:
                print(f"     ✓ 正确隐藏了其他玩家的手牌")
            else:
                print(f"     ✗ 没有正确隐藏手牌")
    
    # 5. 检查玩家2的视图
    print("\n5. 检查玩家2的手牌...")
    response = requests.get(f'{BASE_URL}/api/game/{room_code}/{player_id_2}')
    if response.status_code == 200:
        data = response.json()
        game_state = data.get('gameState', {})
        players = game_state.get('players', [])
        
        for player in players:
            p_id = player.get('id')
            name = player.get('name')
            hand = player.get('hand', [])
            is_current = p_id == player_id_2
            
            if is_current:
                print(f"   玩家{p_id} ({name}):")
                print(f"     手牌数: {len(hand)}")
                
                has_real = any(h in ["H", "O", "C", "N", "F"] for h in hand)
                if has_real:
                    print(f"     ✓ 手牌显示正确！")
    
    print("\n" + "=" * 60)
    print("测试完成！")
    print("=" * 60)

if __name__ == '__main__':
    try:
        test_full_game_flow()
    except Exception as e:
        print(f"错误: {e}")
        import traceback
        traceback.print_exc()
