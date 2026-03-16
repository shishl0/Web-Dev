N = int(input())  
arr = list(map(int, input().split()))  

print(*arr[::2])  