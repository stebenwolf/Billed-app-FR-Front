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
    test("A click on the 'New bill' button should call the handleClickNewBill method", () => {
      /* document.body.innerHTML = BillsUI({data: bills})
      const initialPage = document.location.href
      expect(initialPage).toEqual("http://localhost/employee/bills") */

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
  })
})
