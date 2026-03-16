N = int(input())
print(sum(1 for _ in range(N) if int(input()) == 0))