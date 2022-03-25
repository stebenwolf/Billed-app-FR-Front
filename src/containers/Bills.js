import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  sortByDate = (list) => {
    const byDate = list.slice(0)
    byDate.sort((a, b) => {
        // pour trier les dates qui sont actuellement au format string "YYYY-MM-DD", on compare leur timestamp via un Date.parse(), sans changer le format de la variable.
        return Date.parse(a.date) - Date.parse(b.date)
    })
    return byDate
  }

  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        
        const bills = this.sortByDate(snapshot)
          .map(doc => {
            try {
              console.log(doc.date)
              
              return {
                ...doc,
                //date: formatDate(doc.date),
                date: doc.date,
                status: formatStatus(doc.status)
              }
              
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          console.log('length', bills.length)
        return bills
      })
    }
  }
}
