use std::io;

fn main(){
    println!("Think of a number between 1 and 100.");
    println!("I will try to guess it!");
    println!("respond with high, low or correct");

    let mut low = 1;
    let mut high = 100;
    let mut guesses = 0;

    loop{
        if low > high{
            println!("Something went wrong, are your answers consistent?");
            break;
        }
        let guess = (low + high) /2;
        guesses += 1;
        println!("Is your number {}?", guess);

        let mut feedback = String::new();
        io::stdin()
            .read_line(&mut feedback)
            .expect("Failed to read input");

        match feedback.trim(){
            "high" => high =guess -1,
            "low" => low = guess + 1,
            "correct" => {
                println!("found it");
                println!("I guessed it in {} tries!", guesses);

                break;
            }
            _ => println!("please type: high, low or correct"),
        }

    }

    // let guess = (low + high) /2;
    // high = guess -1;
    // low = guess + 1;
}