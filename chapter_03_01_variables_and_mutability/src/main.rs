fn main(){
    let mut t = 3;
    println!("the value of t is :{t}  ");

    t = 4;

    let t = t + 1;
    {
        let t = t * 5;
        println!("the value of t is: {t}");
    }
    println!("the value of t is: {t}")

}