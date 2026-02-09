//What is the code below going to output?
alert(null || 2 || undefined); //2

//What's the result of OR'ed alerts?
alert(alert(1) || 2 || alert(3)); //1, then 2

//What is the result of AND?
alert(1 && null && 2); //null

//What is the result of AND'ed alerts?
alert(alert(1) && alert(2)); //1, then undefined

//The result of OR AND OR
alert(null || (2 && 3) || 4);

//Write an if condition to check that age is between 14 and 90 inclusively.
if (age >= 14 && age <= 90);

//Write an if condition to check that age is NOT between 14 and 90 inclusively.
if (!(age >= 14 && age <= 90));

//Which of these alerts are going to execute?
if (-1 || 0) alert("first");
if (-1 && 0) alert("second");
if (null || (-1 && 1)) alert("third");
