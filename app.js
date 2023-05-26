//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-abhishek:test123@cluster0.p77z41n.mongodb.net/todolistDB");
const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "welcome to your todolist"
});

const item2 = new Item({
  name: "click + button" 
});

const item3 = new Item({
  name: "delete"
});

const listSchema = {
  name: String,
  list: [itemSchema]
};

const List = mongoose.model("List", listSchema);

const defaultArray = [item1, item2, item3];

app.get("/", function (req, res) {

  Item.find()
    .then(function (data) {
      if (data.length === 0) {

        Item.insertMany(defaultArray)
          .then(function () {
            console.log("Successfully saved defult items to DB");
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/");
      }
      else {
        res.render("list", { listTitle: "Today", newListItems: data });
      }

    })
    .catch(function (err) {
      console.log(err);
    });

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: listName })
      .then(function (foundLIst) {
        foundLIst.list.push(item);
        foundLIst.save();
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.log(err);
      })
  }

});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(function (result) {
      if (!result) {
        const list = new List({
          name: customListName,
          list: defaultArray
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        res.render("list", { listTitle: result.name, newListItems: result.list })
      }
    })
    .catch(function (err) {
      console.log(err);
    })

});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(() => {
        console.log("Succesfully deleted checked item from the database");
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      })
  }
  else {
    List.findOneAndUpdate({ name: listName }, { $pull: { list: { _id: checkedItemId } } })
      .then(function (found) {
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.log(err);
      })
  }

});


app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
