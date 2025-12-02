module counter::counter {
    use std::signer;

    /// constants
    const COUNT_THRESHOLD: u64 = 1_000;
    

    /// Resource to store voting state
    struct Counter has key {
        current_count: u64
    }

    fun init_counter(sender: &signer) {
        let counter = Counter {
            current_count: 0
        };
        move_to(sender, counter);
    }

    public entry fun add_counter(sender: &signer, amount: u64) acquires Counter {
        let sender_address = signer::address_of(sender);

        if (!exists<Counter>(sender_address)) {
            init_counter(sender);
        };

        let counter = borrow_global_mut<Counter>(sender_address);

        if (counter.current_count >= COUNT_THRESHOLD) {
            counter.current_count += 0;
        } else {
            counter.current_count += amount;
        }
    }

    public entry fun subtract_counter(sender: &signer, amount: u64) acquires Counter {

        let sender_address = signer::address_of(sender);

        if (!exists<Counter>(sender_address)) {
            init_counter(sender);
        };

        let counter = borrow_global_mut<Counter>(sender_address);

        counter.current_count -= amount;
    }

    #[view]
    public fun get_counter(sender_address: address): u64 acquires Counter {
        borrow_global<Counter>(sender_address).current_count
    }
}
