const postDeleteTransaction = (btn) => {
  const transactionID = btn.parentNode.querySelector(
    '[name="transactionID"]'
  ).value;
  const userID = btn.parentNode.querySelector('[name="userID"]').value;
  const transactionhtml = btn.parentNode;
  const csrf = btn.parentNode.querySelector('[name="_csrf"]').value;
  document.querySelector(".user-debt").innerHTML += " dasin";
  console.log(transactionhtml.parentNode.childNodes);

  transactionhtml.remove();
  
  console.log(transactionhtml.parentNode.childNodes);
  // fetch(
  //   `http://localhost:3000/admin/delete?transactionID=${transactionID}&userID=${userID}`,
  //   {
  //     method: "DELETE",
  //     headers: {
  //       "csrf-token": csrf,
  //     },
  //   }
  // )
  //   .then((res) => {
  //     return res.json();
  //   })
  //   .then((final) => {
  //     if (final.message === "deleted profile successfully") {
  //       window.location = "/admin/allUsers";
  //     } else {
  //       document.querySelector(".user-debt").innerHTML = final.debt + " din";
  //       transactionhtml.innerHTML = "";
  //     }
  // })
  // .catch((er) => {
  //   console.log(er);
  // });
};
