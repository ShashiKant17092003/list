const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://SK:1793@cluster0.s8nzubr.mongodb.net/todolistDB");

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const defaultItem = [item1]; 

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItem, function (err, item) {
        if (err) {
          console.log(err);
        } else {
          console.log("Data inserted");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = (req.body.list);
  const item = new Item({
    name: itemName,
  });
  if(listName === "Today") {
    item.save();
  res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
 
});

app.post("/delete", function (req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today") {
    setTimeout(function () {
      Item.findByIdAndRemove(checkedItem, function (err) {
        if(!err){
          console.log("Item Deleted");
          res.redirect("/");
        }
      });
    }, 500);
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
});
app.get("/:paramName", function (req, res) {
  const customParamName = _.capitalize(req.params.paramName);
    
  List.findOne({ name: customParamName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customParamName,
          items: defaultItem,
        });
        list.save();
        res.redirect("/"+customParamName);
      }else{
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started on port 3000");
});
