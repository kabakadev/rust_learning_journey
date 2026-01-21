fn main(){
    let result = create_data();
    println!("Data: {}", result);
}

fn create_data() -> String{
    let s = String::from("vital information");
    s
}