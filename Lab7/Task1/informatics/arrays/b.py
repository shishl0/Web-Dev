N = int(input())  
arr = list(map(int, input().split()))  

print(*[x for x in arr if x % 2 == 0])  