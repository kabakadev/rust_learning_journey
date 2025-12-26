#[derive(Debug)]
struct User{
        active:bool,
        username:String,
        email:String,
        sign_in_count:u64,

    }

#[derive(Debug)]
struct Color(i32,i32,i32);
#[derive(Debug)]
struct Point(i32,i32,i32);


#[derive(Debug)]
struct AlwaysEqual;


fn main() {
    let subject = AlwaysEqual;

    let black = Color(0,0,0);
    let origin = Point(0,0,0);
  
    let mut user1 = User{
        active:true,
        username:String::from("someusername123"),
        email:String::from("someone@example.com"),
        sign_in_count:1,
    };

    user1.email = String::from("neanderathal@gmail.com");

    let user2 = User {
        email:String::from("anotherexamp@example.com"),
        ..user1
    };
    
    let read_user = build_user(String::from("Johwick@email.com"),String::from("Kabaka"));

    println!("here lies {:?}, and here is {:?}, right here is {:?}, ALSO {:?}, this is what the user reads, {:?}", black,origin,user2, subject,read_user);
}

fn build_user(email:String, username:String) -> User{
    User{
        active:true,
        username,
        email,
        sign_in_count:1,
    }
}