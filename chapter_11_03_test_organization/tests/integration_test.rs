use chapter_11_03_test_organization::add_two;


#[test]
fn it_adds_two() {
    let result = add_two(2);
    assert_eq!(result, 4);
}