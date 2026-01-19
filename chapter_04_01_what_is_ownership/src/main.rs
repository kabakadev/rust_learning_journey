fn main(){
    let mut s = String::from("hello");
    //scope 1: the writer works alone
    let r1 = &mut s;
    r1.push_str(", world"); //
    println!("{}", r1);
    //r1 is no longer used after this, so its "lock" on is released

    //scope 2: the reader comes in afterwards
    let r2 = &s;
    println!("{}", r2);
}