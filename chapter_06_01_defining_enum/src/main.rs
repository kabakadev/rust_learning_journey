fn main() {
    println!("Hello, world!");
    let four = IpAddrKind::V4;
    let six = IpAddrKind::V6;

    route(IpAddrKind::V4);
    route(IpAddrKind::V6);
    let home = IpAddr::V4(127,0,0,1);
    let loopback = IpAddr::V6(String::from("::1"));
    

}

enum IpAddrKind{
    V4,
    V6,
}

enum IpAddr {
        V4(u8,u8,u8,u8),
        V6(String),
    }


fn route(ip_kind:IpAddrKind){}