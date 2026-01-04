fn main() {
    let mut s1 = String::from("foo");
    let s2 = "bar";
    s1.push_str(s2);
    println!("s2 is {s2}");
    let mut s = String::from("lo");
    s.push('l');
    println!("{}", s);
    let s1 = String::from("Hello, ");
    let s2 = String::from("world!");
    let s3 = s1 + &s2; // note s1 has been moved here and can no longer be used
    //
    println!("{}", s3);
    let n1 = String::from("tic");
    let n2 = String::from("tac");
    let n3 = String::from("toe");

    let n = n1 + "-" + &n2 + "-" + &n3;
    println!("{}", n);
    let helloguy = "Здравствуйте";

    let f = &helloguy[0..4];
    println!("{}", f);
    for c in "Зд".chars() {
        println!("{c}");
    }
    for b in "Зд".bytes() {
        println!("{b}");
    }




}
