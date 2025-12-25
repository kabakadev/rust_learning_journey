fn main(){
    let my_string = String::from("hello world");
    let word1 = first_word(&my_string[0..6]);
    let word2 = first_word(&my_string[..]);

    let word3 = first_word(&my_string);

    let my_string_literal = "hello world";

    let word4 = first_word(&my_string_literal[0..6]);
    let word5 = first_word(&my_string_literal[..]);
    let word6 = first_word(my_string_literal);
    println!("{}",word1);
    println!("{}",word2);
    println!("{}",word3);
    println!("{}",word4);
    println!("{}",word5);
    println!("{}",word6);
}

fn first_word(s:&str) -> &str{
    let bytes = s.as_bytes();
    for (i, &item) in bytes.iter().enumerate(){
        if item == b' '{
            return &s[0..i];
        }
    }
    return &s[..]
}