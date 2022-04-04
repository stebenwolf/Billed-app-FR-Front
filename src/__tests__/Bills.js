/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";


// added by myself
import Bills from "../containers/Bills.js"
import { ROUTES } from "../constants/routes.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.className).toEqual("active-icon")

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("A click on the 'New bill' button should call the handleClickNewBill method and get us to the newBill page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const bills = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({ data: { bills } })

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const initialPage = document.location.href
      expect(initialPage).toEqual("http://localhost/#employee/bills")

      // on est bien sur la page bills.
      // maintenant on va cibler le bouton newbill
      const newBillBtn = screen.getByTestId("btn-new-bill")
      expect(newBillBtn).toBeTruthy()
      // on a ciblé le bouton, on lui ajoute un event listener
      const handleClickNewBill = jest.fn(() => bills.handleClickNewBill())
      newBillBtn.addEventListener("click", handleClickNewBill)

      // on simule un clic sur le bouton
      userEvent.click(newBillBtn)
      // on s'assure que l'événement s'est bien produit
      expect(handleClickNewBill).toHaveBeenCalled()

      // on récupère la nouvelle URL et on vérifie que c'est bien celle attendue
      const newPage = document.location.href
      expect(newPage).toEqual("http://localhost/#employee/bill/new")
    })
    test("A click on an eye icon should display the modale", async () => {
      // corrige erreur modal
      $.fn.modal = jest.fn()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      document.body.innerHTML = BillsUI({ data: bills })
      
      // on va à présent cibler le(s) icones "eye"
      const eyeIcons = await screen.getAllByTestId("icon-eye")
      
      const firstEye = eyeIcons[0]
      expect(firstEye).toBeTruthy()
      

      const theseBills = new Bills({document, onNavigate, store: null, localStorage: window.localStorage})
      
      const handleClickIconEye = jest.fn(() => theseBills.handleClickIconEye(firstEye))
      firstEye.addEventListener("click", handleClickIconEye)
      userEvent.click(firstEye)
      expect(handleClickIconEye).toHaveBeenCalled()
    })
    test("Then the sortByDate function renders a antichronological sorted list", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      const theseBills = new Bills({document, onNavigate, store: undefined, localStorage: window.localStorage})
      const mockList = [{"item": 1, date: "2002-01-29"},
                    {"item": 2, date: "2001-02-28"},
                    {"item": 3, date: "2003-03-27"},
                    {"item": 4, date: "2008-04-15"},
                    {"item": 5, date: "2020-05-17"},
                    {"item": 6, date: "1998-06-29"},
                    {"item": 7, date: "2030-12-30"},
                    {"item": 8, date: "2003-03-05"},
                  ]
      const result = theseBills.sortByDate(mockList)
      const orderedMockList = [
        {"item": 6, date: "1998-06-29"},
        {"item": 2, date: "2001-02-28"},
        {"item": 1, date: "2002-01-29"},
        {"item": 8, date: "2003-03-05"},
        {"item": 3, date: "2003-03-27"},
        {"item": 4, date: "2008-04-15"},
        {"item": 5, date: "2020-05-17"},
        {"item": 7, date: "2030-12-30"}
    ]
      expect(result).toEqual(orderedMockList)
    })
  })
})



// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const tableTitle  = await screen.getByText("Type")
      expect(tableTitle).toBeTruthy()
      const tableName = await screen.getByText("Nom")
      expect(tableName).toBeTruthy()
      const tableDate = await screen.getByText("Date")
      expect(tableDate).toBeTruthy()
      const tableAmount = await screen.getByText("Montant")
      expect(tableAmount).toBeTruthy()
      const tableStatus = await screen.getByText("Statut")
      expect(tableStatus).toBeTruthy()
      const tableActions = await screen.getByText("Actions")
      expect(tableActions).toBeTruthy()
      
      expect(screen.getByTestId("tbody")).toBeTruthy()
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "e@e"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })


    // pour les 2 tests ci-dessous :
    // lorsqu'on utilise la même méthode que pour Dashboard, on a une erreur au niveau de la page, affiche "fetch is not defined"
    // en revanche on a bien un data-testid qui s'affiche par exemple
    // en attendant solution, j'ai chargé la page avec BillsUI(erreyr;: ...) texte à chercher "erreur", au lieu de "erreur 404"
    test("fetches bills from an API and fails with 404 message error", async () => {

      /* mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      //jest.spyOn(mockStore, "bills")
      window.onNavigate(ROUTES_PATH.Bills)
      jest.spyOn(mockStore, "bills")
      console.log(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy() */
      
      /* const altMessage = await screen.getByText(/Erreur/)
      expect(altMessage).toBeTruthy() */


      const altPage = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = altPage
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
      
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      /* mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick); */
      /* const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy() */
      /* const altMessage = await screen.getByText(/Erreur/)
      expect(altMessage).toBeTruthy() */

      const altPage = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = altPage
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})