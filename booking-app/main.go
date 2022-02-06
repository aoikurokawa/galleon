package main

import (
	"booking-app/helper"
	"fmt"
	"strconv"
)

const conferenceTicket uint = 50

var conferenceName = "Go Conference"
var remainingTickets uint = 50
var bookings = make([]map[string]string, 0)

func main() {

	greetUser()

	// infinite loop
	for {

		firstName, lastName, email, userTickets := getUserInput()

		// import from helper package. capitalize letter function name
		isValidName, isValidEmail, isValidTicketNumber := helper.ValidateUserInput(firstName, lastName, email, userTickets, remainingTickets)

		// isValidCity := city == "London" || city == "Singapore"
		// !isValidCity

		if isValidName && isValidEmail && isValidTicketNumber {

			bookTicket(remainingTickets, userTickets, firstName, lastName, conferenceName, email)

			// call function print first name
			firstNames := getFirstNames()
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

func greetUser() {
	fmt.Printf("Welcome to %v booking application.\n", conferenceName)
	fmt.Printf("We have total of %v tickets and %v are still available.\n", remainingTickets, conferenceTicket)
	fmt.Println("Get your tickets here to attend")
}

func getFirstNames() []string {
	firstNames := []string{}
	for _, booking := range bookings {
		firstNames = append(firstNames, booking["firstName"])
	}

	return firstNames
}

func getUserInput() (string, string, string, uint) {
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

	return firstName, lastName, email, userTickets

}

func bookTicket(remainingTickets uint, userTickets uint, firstName string, lastName string, conferenceName string, email string) {
	remainingTickets -= userTickets
	// bookings[0] = firstName + " " + lastName

	// create a map for a user
	var userData = make(map[string]string)
	userData["firstName"] = firstName
	userData["lastName"] = lastName
	userData["email"] = email
	userData["numberOfTicket"] = strconv.FormatUint(uint64(remainingTickets), 10)

	bookings = append(bookings, userData)
	fmt.Printf("List of bookings is %v\n", bookings)

	// fmt.Printf("The whole slice: %v\n", bookings)
	// fmt.Printf("The first value: %v\n", bookings[0])
	// fmt.Printf("Slice value: %T\n", bookings)
	// fmt.Printf("Slice length: %v\n", len(bookings))

	fmt.Printf("Thank you %v %v for booking %v tickets. You will receive a confirmation email at %v.\n", firstName, lastName, userTickets, email)
	fmt.Printf("%v tickets remaining for %v\n", remainingTickets, conferenceName)
}
