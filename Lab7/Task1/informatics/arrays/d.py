N = int(input())  
arr = list(map(int, input().split()))  

print(sum(1 for i in range(1, N) if arr[i] > arr[i - 1]))  