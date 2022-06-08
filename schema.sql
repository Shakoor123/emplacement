create table student(rno bigint,name varchar(200),branch varchar(10),email varchar(200),phone bigint,cgpa float,password varchar(200));
create table notification(id varchar(200),title varchar(100),discription varchar(200),cgpa float,date varchar(100));
create table images(name varchar(100));
create table admin(username varchar(100),password varchar(100));

mysql -h mysqldatabase-001.mysql.database.azure.com -u mysqlusertest001 -pvbBv7ZuWxcpSweX