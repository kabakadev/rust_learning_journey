fn main() {
    let v = vec![1, 2, 3];

    //v[99] this will cause a panic;
    // panic!("crash and burn") this will also panic8
    println!("{}",v[0]);//no panic here
    println!("this part won't crash and burn fortunately");
    
}
