fn main() {
    value_in_cents(Coin::Quarter(UsState::Alaska));

}
#[derive(Debug)] 
enum UsState {
    Alabama,
    Alaska,
    // --snip--
}

enum Coin{
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}

fn value_in_cents(coin: Coin) -> u8 {
    let mut count = 0;
    if let Coin::Quarter(ref state) = coin {
        println!("State quarter from {state:?}!");
    } else {
        count += 1;
    }

    match coin {
        Coin::Penny => {
            println!("Lucky penny!");
            1
        }
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("State quarter from {state:?}!");
            25
        },
    }
}
