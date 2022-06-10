create table student(rno bigint,name varchar(200),branch varchar(10),email varchar(200),phone bigint,cgpa float,password varchar(200));
create table notification(id varchar(200),title varchar(100),discription varchar(200),cgpa float,date varchar(100));
create table images(name varchar(100));
create table admin(username varchar(100),password varchar(100));



create
table s1654857207521(
  phone bigint not null,
  primary key (phone),
  FOREIGN KEY (phone) REFERENCES student(phone)
);


create table student01(rno bigint,name varchar(200),branch varchar(10),email varchar(200),phone bigint,cgpa float,password varchar(200), primary key (phone));

create
table s1654857207521(
  phone bigint not null,
  primary key (phone),
  FOREIGN KEY (phone) REFERENCES student01(phone)
);


ALTER TABLE student
ADD PRIMARY KEY (phone); 


SELECT rno,name,branch,email,phone,cgpa
FROM student,s1654858526094
where s1654858526094.phone=student.phone;