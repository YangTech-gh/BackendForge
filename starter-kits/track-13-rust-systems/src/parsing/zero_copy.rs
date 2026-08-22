pub fn zero_copy_parse(input: &str) -> Vec<&str> {
    input.split_terminator(|c: char| c.is_whitespace() && c != ' ').collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_zero_copy_split() {
        let input = "hello world foo bar";
        let result: Vec<&str> = zero_copy_parse(input);
        assert_eq!(result, vec!["hello", "world", "foo", "bar"]);
    }

    #[test]
    fn test_zero_copy_empty() {
        let result: Vec<&str> = zero_copy_parse("");
        assert!(result.is_empty());
    }
}
