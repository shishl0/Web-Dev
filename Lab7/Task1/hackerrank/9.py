if __name__ == '__main__':
    n = int(input())
    student_marks = {}

    for _ in range(n):
        data = input().split()
        student_marks[data[0]] = list(map(float, data[1:]))

    query_name = input()
    print(f"{sum(student_marks[query_name]) / len(student_marks[query_name]):.2f}")