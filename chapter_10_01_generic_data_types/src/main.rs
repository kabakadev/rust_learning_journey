fn largest<T:std::cmp::PartialOrd>(list: &[T]) -> &T{
    let mut largest = &list[0];
    for item in list{
        if item > largest{
            largest = item;
        }
    }
    largest
}


fn main() {
    let number_list =vec![34,50,25,100,65];
    let result = largest(&number_list);
    println!("the largest number is {result}");
    let number_char = vec!['y', 'm','a','q'];
    let result = largest(&number_char);
    println!("the largest number is {result}");
}
