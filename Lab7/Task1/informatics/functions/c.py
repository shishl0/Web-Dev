def xor(x, y):
    return 1 if x != y else 0  

x, y = map(int, input().split())  
print(xor(x, y))  