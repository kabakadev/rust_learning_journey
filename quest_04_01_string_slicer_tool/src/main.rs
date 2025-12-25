fn main() {
    let word = String::from("Hello, world!");
    let see_word = first_word(&word);
    println!("the first word is: {}", see_word);

    let single_word = String::from("Rust");
    let first_word_without_space = first_word(&single_word);
    println!("the word without space is: {}", first_word_without_space);

    let string_literal = "hi man, sup";
    let this_will_work = first_word(string_literal);
    println!("this will work as expected and print the string literal:{}",this_will_work );

    
}
fn first_word(s:&str) -> &str{
    let bytes = s.as_bytes();
    for (i,&item) in bytes.iter().enumerate(){
        if item == b' '{
            return &s[..i]
        }
    }
    return &s[..]
}