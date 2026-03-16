def power(a: float, n: int) -> float:
    return a ** n  


a, n = map(float, input().split())  
n = int(n)  
print(power(a, n))