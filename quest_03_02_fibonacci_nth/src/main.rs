fn main(){
    fibonacci_gen(12);
}
fn fibonacci_gen(num:u32)-> u32{
    let mut prev_num = 0;
    println!("{}",prev_num);
    let mut next_num = 1;
    for _ in 1 .. num{
        let sum = prev_num + next_num;
        prev_num = next_num;
        next_num = sum;
    }
    println!("{}",next_num);
    return next_num;    
}