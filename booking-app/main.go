package main

import (
	"fmt"
	"strings"
)

func main() {
	var conferenceName = "Go Conference"
	const conferenceTicket = 50
	var remainingTickets uint = 50

	greetUser(conferenceName, remainingTickets, conferenceTicket)

	// infinite loop
	for {
		var bookings []string

		var firstName string
		var lastName string
		var email string
		var userTickets uint
		// ask user for their name
		fmt.Println("Enter your first name: ")
		fmt.Scan(&firstName)

		fmt.Println("Enter your last name: ")
		fmt.Scan(&lastName)

		fmt.Println("Enter your email address: ")
		fmt.Scan(&email)

		fmt.Println("Enter number of tickets: ")
		fmt.Scan(&userTickets)

		isValidName := len(firstName) >= 2 && len(lastName) >= 2
		isValidEmail := strings.Contains(email, "@")
		isValidTicketNumber := userTickets > 0 && userTickets <= remainingTickets

		// isValidCity := city == "London" || city == "Singapore"
		// !isValidCity

		if isValidName && isValidEmail && isValidTicketNumber {
			remainingTickets -= userTickets
			// bookings[0] = firstName + " " + lastName
			bookings = append(bookings, firstName+" "+lastName)

			// fmt.Printf("The whole slice: %v\n", bookings)
			// fmt.Printf("The first value: %v\n", bookings[0])
			// fmt.Printf("Slice value: %T\n", bookings)
			// fmt.Printf("Slice length: %v\n", len(bookings))

			fmt.Printf("Thank you %v %v for booking %v tickets. You will receive a confirmation email at %v.\n", firstName, lastName, userTickets, email)
			fmt.Printf("%v tickets remaining for %v\n", remainingTickets, conferenceName)

			firstNames := []string{}
			for _, booking := range bookings {
				var names = strings.Fields(booking)
				firstNames = append(firstNames, names[0])
			}
			fmt.Printf("The first names of our whole bookings are: %v\n", firstNames)

			noTicketRemaining := remainingTickets <= 0

			if noTicketRemaining {
				// end program
				fmt.Println("Our conference is booked out. Come back next year.")
				break
			}
		} else if userTickets == remainingTickets {
			// do something else
			continue
		} else {
			// fmt.Printf("We only have %v tickets remaining, so you can't book %v tickets.\n", remainingTickets, userTickets)
			if !isValidName {
				fmt.Printf("First name or last name you entered is too short.\n")
			}

			if !isValidEmail {
				fmt.Printf("Email address you entered does't contain '@' sign\n")
			}

			if !isValidTicketNumber {
				fmt.Printf("Number of tickets you entered is invalid. \n")
			}
			fmt.Printf("Your input data is invalid, try again.\n")
			continue
		}

	}

	// city := "Loondon"

	// switch city {
	// case "New York":
	// 	// executes code for booking new york conference tickets.
	// case "Singapore":
	// 	// execute code for booking singapore conference tickets
	// case "HongKong", "London":
	// 	// execute code for booking singapore conference tickets
	// case "Mexico city":
	// 	// execute code for booking singapore conference tickets
	// default:
	// 	fmt.Println("No valid city selected.")
	// }

}

func greetUser(confName string, remainingTickets uint, conferenceTicket uint) {
	fmt.Printf("Welcome to %v booking application.\n", confName)
	fmt.Printf("We have total of %v tickets and %v are still available.\n", remainingTickets, conferenceTicket)
	fmt.Println("Get your tickets here to attend")
}
