import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from 'lodash';
const app = express();
const port = 3000;
import 'dotenv/config';

//this is the Todp db
mongoose.connect(process.env.MONGODB_CONNECT_URI);
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//SOME DEFAULT DATABASES
const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: "Always Be Focus On Your Goals"
});

const item2 = new Item({
  name: "Work Bit By Bit"
});

const item3 = new Item({
  name: "Dont worry You'll reach there"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = new mongoose.model("List", listSchema);

//This will handle the first rendering page of the website
app.get("/", (req, res) => {
  async function main1() {
    try {
      const item = await Item.find({});
      if(item.length === 0){
        async function main() {
          try {
            await Item.insertMany(defaultItems);
            console.log("Insertion successful");
          } catch (error) {
            console.error("Error occurred:", error);
          }
        }
        main();
        res.redirect("/");
      }else{
        res.render("index.ejs", {listTitle: "To Do List", newListItems: item});
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }
  }
  main1();
});

app.post("/", (req, res)=>{
  let tasks = req.body["task"];
  let  listName = req.body["list"];
  // console.log(listName);
  const item = new Item({
    name: tasks
  });

  if(listName == "To Do List"){
    item.save();
    res.redirect("/");
  }
  else{
    async function main6() {
      try {
      const foundList = await List.findOne({name: listName});
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
      }
     catch (err) {
      console.error(err);
    }
  }
  main6();
}
});

app.get("/:customListName", (req, res)=>{
   const customListName = _.capitalize(req.params.customListName);
  console.log(customListName);
   async function main5() {
    try {
    const foundList = await List.findOne({name: customListName});
    if(!foundList){
      //create new list
      const list = new List({
        name: customListName,
        items: defaultItems
       });
    
       list.save();
       res.redirect("/" + customListName);
    }
    else{
      //show an existing list
      res.render("index.ejs", {listTitle: foundList.name, newListItems: foundList.items});
    }
    } catch (err) {
      console.error(err);
    }
  }
  main5();

});


app.post("/delete", (req, res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  // console.log(listName);
  if(listName === "To Do List"){
    async function main4() {
      try {
      await Item.deleteOne({_id: checkedItemId});
        console.log(`Document deleted successfully`);
        res.redirect("/");
      } catch (err) {
        console.error(err);
      }
    }
    main4();
  }
  else{
    async function main8() {
      try {
      await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}); 
        res.redirect("/" + listName);
      } catch (err) {
        console.error(err);
      }
    }
    main8();
  }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
