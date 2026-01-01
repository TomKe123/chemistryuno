#!/usr/bin/env python
# -*- coding: utf-8 -*-
import requests
import json

BASE_URL = 'http://localhost:5000'

def diagnose_both_unknown():
    """诊断双方卡牌均Unknown的问题"""
    print("=" * 60)
    print("诊断：双方卡牌均Unknown问题")
    print("=" * 60)
    
    # 1. 创建房间
    print("\n1. 创建房间...")
    response = requests.post(f'{BASE_URL}/api/game/create', json={
        'playerName': '诊断玩家1'
    })
    data = response.json()
    room_code = data.get('roomCode')
    player_id_1 = data.get('playerId')
    print(f"   房间号: {room_code}, 玩家1 ID: {player_id_1} (类型: {type(player_id_1).__name__})")
    
    # 2. 加入房间
    print("\n2. 加入房间...")
    response = requests.post(f'{BASE_URL}/api/game/join', json={
        'roomCode': room_code,
        'playerName': '诊断玩家2',
        'asSpectator': False
    })
    player_id_2 = response.json().get('playerId')
    print(f"   玩家2 ID: {player_id_2} (类型: {type(player_id_2).__name__})")
    
    # 3. 开始游戏
    print("\n3. 开始游戏...")
    response = requests.post(f'{BASE_URL}/api/game/{room_code}/start', json={
        'playerId': player_id_1
    })
    print(f"   游戏已启动")
    
    # 4. 测试两种获取方式
    print("\n4. 通过不同方式获取游戏状态...")
    
    # 方式A: 使用 /api/game/:roomCode/:playerId
    print("\n   方式A: GET /api/game/{room_code}/{player_id_1}")
    response = requests.get(f'{BASE_URL}/api/game/{room_code}/{player_id_1}')
    if response.status_code == 200:
        data = response.json().get('gameState', {})
        players = data.get('players', [])
        print(f"   返回的playerId参数类型: {type(player_id_1).__name__} (值: {player_id_1})")
        for p in players:
            hand = p.get('hand', [])
            print(f"   玩家{p['id']}: 手牌={hand[:3]}... (是否全unknown={all(h == 'unknown' for h in hand)})")
    else:
        print(f"   ✗ 失败: {response.status_code}")
    
    # 方式B: 模拟前端可能的传参（作为字符串）
    print(f"\n   方式B: GET /api/game/{room_code}/{str(player_id_1)}")
    response = requests.get(f'{BASE_URL}/api/game/{room_code}/{str(player_id_1)}')
    if response.status_code == 200:
        data = response.json().get('gameState', {})
        players = data.get('players', [])
        for p in players:
            hand = p.get('hand', [])
            print(f"   玩家{p['id']}: 手牌={hand[:3]}... (是否全unknown={all(h == 'unknown' for h in hand)})")
    
    # 5. 通过 /api/game/:roomCode/info 方式
    print(f"\n   方式C: GET /api/game/{room_code}/info")
    response = requests.get(f'{BASE_URL}/api/game/{room_code}/info')
    if response.status_code == 200:
        data = response.json().get('gameState', {})
        players = data.get('players', [])
        print(f"   返回players: {len(players)}")
        for p in players:
            hand = p.get('hand', [])
            print(f"   玩家{p['id']}: 手牌={hand[:3]}... (全unknown={all(h == 'unknown' for h in hand)})")

if __name__ == '__main__':
    try:
        diagnose_both_unknown()
    except Exception as e:
        print(f"错误: {e}")
        import traceback
        traceback.print_exc()
