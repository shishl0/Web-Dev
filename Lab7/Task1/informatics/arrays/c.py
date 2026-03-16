N = int(input())  
arr = list(map(int, input().split()))  

print(sum(1 for x in arr if x > 0))  