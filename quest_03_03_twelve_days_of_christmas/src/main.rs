fn main(){
    let days = ["First", "Second", "Third", "Fourth", "Fifth","Sixth", "Seventh","Eighth","Ninth","Tenth", "Eleventh", "Twelfth"];
    let lyrics = ["A partridge in a pear tree.","Two turtle doves, and","Three French hens,","Four calling birds,","Five golden rings,","Six geese a-laying,","Seven swans a-swimming,","Eight maids a-milking,","Nine ladies dancing,","Ten lords a-leaping,","Eleven pipers piping,","Twelve drummers drumming"];
    for day in 0..12{
        println!("on the {}, of christmas my true love gave to me",days[day]);
        for i in (0..day + 1).rev(){
            
            println!("{}", lyrics[i]);
        }
    }
}

