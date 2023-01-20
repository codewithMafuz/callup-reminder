// for pop overs import and export data --->
var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="infoExport"],[data-bs-toggle="infoImport"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})
// toastTrigger
const toastTrigger = document.getElementById('liveToastBtn')
const toastLiveExample = document.getElementById('liveToast')
if (toastTrigger) {
  toastTrigger.addEventListener('click', () => {
    const toast = new bootstrap.Toast(toastLiveExample)

    toast.show()
  })
}








