import heapq
from collections import defaultdict


def dijkstra(graph: dict[int, list[tuple[int, float]]], start: int, end: int):
    pq = [(0.0, start, [start])]
    best = defaultdict(lambda: float("inf"))
    best[start] = 0.0

    while pq:
        cost, node, path = heapq.heappop(pq)
        if node == end:
            return cost, path

        for nxt, weight in graph.get(node, []):
            new_cost = cost + weight
            if new_cost < best[nxt]:
                best[nxt] = new_cost
                heapq.heappush(pq, (new_cost, nxt, path + [nxt]))

    return float("inf"), []


def build_demo_graph() -> dict[int, list[tuple[int, float]]]:
    return {
        1: [(2, 4.2), (3, 6.0)],
        2: [(1, 4.2), (4, 2.8), (5, 5.1)],
        3: [(1, 6.0), (4, 2.1)],
        4: [(2, 2.8), (3, 2.1), (5, 3.4), (6, 4.2)],
        5: [(2, 5.1), (4, 3.4), (6, 2.6)],
        6: [(4, 4.2), (5, 2.6)],
    }
