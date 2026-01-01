#!/usr/bin/env python
# -*- coding: utf-8 -*-
import requests
import time

BASE_URL = 'http://localhost:5000'

print("\n" + "="*60)
print("测试修复后的卡牌显示问题")
print("="*60)

try:
    # 1. 创建房间
    print("\n1. 创建房间...")
    response = requests.post(f'{BASE_URL}/api/game/create', json={'playerName': '玩家甲'}, timeout=5)
    room_code = response.json().get('roomCode')
    print(f"   ✓ 房间号: {room_code}")
    
    # 2. 加入房间
    print("\n2. 加入房间...")
    response = requests.post(f'{BASE_URL}/api/game/join', json={
        'roomCode': room_code,
        'playerName': '玩家乙',
        'asSpectator': False
    }, timeout=5)
    print(f"   ✓ 玩家乙加入成功")
    
    # 3. 开始游戏
    print("\n3. 开始游戏...")
    response = requests.post(f'{BASE_URL}/api/game/{room_code}/start', json={'playerId': 0}, timeout=5)
    print(f"   ✓ 游戏已启动")
    time.sleep(0.5)
    
    # 4. 检查游戏状态
    print("\n4. 检查卡牌显示...")
    response = requests.get(f'{BASE_URL}/api/game/{room_code}/0', timeout=5)
    if response.status_code == 200:
        game_state = response.json().get('gameState', {})
        players = game_state.get('players', [])
        
        print(f"   房间: {game_state.get('roomCode')}")
        print(f"   玩家数: {len(players)}")
        
        for p in players:
            pid = p.get('id')
            name = p.get('name')
            hand = p.get('hand', [])
            is_mine = pid == 0
            
            print(f"\n   玩家{pid} ({name}): {'✓ 我的视图' if is_mine else '他人的视图'}")
            print(f"     手牌数: {len(hand)}")
            print(f"     前5张: {hand[:5]}")
            
            if is_mine:
                has_real = any(h in ["H", "O", "C", "N", "F"] for h in hand)
                if has_real and 'unknown' not in hand:
                    print(f"     ✓ 正确显示了自己的卡牌")
                else:
                    print(f"     ✗ 卡牌显示错误")
            else:
                if all(h == 'unknown' for h in hand):
                    print(f"     ✓ 正确隐藏了他人的卡牌")
                else:
                    print(f"     ✗ 没有正确隐藏他人卡牌")
    
    print("\n" + "="*60)
    print("✓ 测试完成")
    print("="*60)
    
except Exception as e:
    print(f"\n✗ 错误: {e}")
    import traceback
    traceback.print_exc()
