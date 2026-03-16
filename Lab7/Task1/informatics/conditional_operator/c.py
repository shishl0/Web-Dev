correct_answer = int(input())
student_answer = int(input())

if correct_answer == 1:
    print("YES" if student_answer == 1 else "NO")
else:
    print("YES" if student_answer != 1 else "NO")