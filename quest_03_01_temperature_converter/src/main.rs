
use std::io;
fn convert_to_f(celsius:f64) -> f64{
    let temp_in_f = (celsius * 1.8) + 32.0;
    temp_in_f
}
fn convert_to_c(fahrenheit_conv:f64) -> f64{
    let temp_in_c = (fahrenheit_conv - 32.0) / 1.8;
    temp_in_c
}
fn input_user_choice(prompt:&str) -> f64{
    loop{
        println!("{prompt}:");
        let mut user_choice = String::new();
        io::stdin().read_line(&mut user_choice).expect("failed to read line");

        match user_choice.trim().parse(){
            Ok(num) => {
                return num
            },
            Err(_)=>{
                println!("you did not input a number, try again");
                continue
            }
        }
    }
}
        
fn main (){
    loop{
        println!("welcome to the temperature converter, convert between fahrenheit and celsius");
        println!("type 1 for c > F or 2 for F > C");
        println!("you can type 0 to quit");
       

        let num_convert = input_user_choice("Enter your choice");

        if num_convert == 1.0 {
            println!("you have picked to convert celsius to fahrenheit, enter a valid celsius number:");
            let celsius_val = input_user_choice("Enter a vailid celsius number");
            let fahrenheit = convert_to_f(celsius_val);
            println!("you picked {celsius_val} Celsius and is converted to {fahrenheit} Fahrenheit");
      

        }
        else if num_convert == 2.0 {
            println!("you have picked to convert fahrenheit to celsius, enter a valid fahrenheit number:");

            let fahrenheit_val = input_user_choice("Enter a valid fahrenheit number");
            let celsius = convert_to_c(fahrenheit_val);
            println!("you picked {fahrenheit_val} fahrenheit and is conveted to {celsius} degrees");
      
            

        }
        else if num_convert == 0.0 {
            println!("exiting the program");
            break;
        } 
        else{
            println!("the number picked was not among the valid options,try again");
      
        }
  
    }
   
}