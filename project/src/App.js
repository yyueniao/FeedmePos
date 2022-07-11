import './App.css';
import React, { useEffect, useState } from 'react';


function App() {
  const [pending, setPending] = useState([]);
  const [pendingVip, setPendingVip] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [bots, setBots] = useState([]);
  const [id, setId] = useState(1);
  const [newBotId, setNewBotId] = useState(1);
  const [newOrder, setNewOrder] = useState({product: '', user: 'Member', processing: false})
  const [newBot, setNewBot] = useState({name: '', processing: null})

  useEffect(() => {
    const findAvailableBots = async function(){
      for(let i = 0; i < bots.length; i++){
        if(bots[i].processing == null){
          await processOrder(bots[i].id);
        }
      }
    }
    findAvailableBots();
  });

  function findNextOrder(){
    for(let i = 0; i < pendingVip.length; i++){
      if(!pendingVip[i].processing){
        return [pendingVip, setPendingVip, i]
      }
    }
    for(let i = 0; i < pending.length; i++){
      if(!pending[i].processing){
        return [pending, setPending, i]
      }
    }
    return [null, null, -1];
  }

  async function callCooking(botId, orderId){
    // some backend calling
    console.log(`Bot ${botId} is cooking Order ${orderId}`);

    function findOrderAndDelete(arr, setArr, id){
      var completedOrder = null;
      for(let i = 0; i < arr.length; i++){
        if(arr[i].id == id){
          var completedOrder = arr[i];
          var updateList = JSON.parse(JSON.stringify(arr));
          updateList.splice(i, 1);
          setArr(updateList);
          break;
        }
      }
      return completedOrder;
    }

    function cookingDone(){
      var completedOrder = findOrderAndDelete(pendingVip, setPendingVip, orderId)
      if(completedOrder == null){ completedOrder = findOrderAndDelete(pending, setPending, orderId) }
      setCompleted([...completed, completedOrder])
      var updateBots = JSON.parse(JSON.stringify(bots));
      updateBots[botId-1].processing = null;
      setBots(updateBots);
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(10000);
    cookingDone();
  }

  async function processOrder(botId){
    const [list, setList, index] = findNextOrder();
    if(index >= 0){
      var updateBots = JSON.parse(JSON.stringify(bots));
      var updateList = JSON.parse(JSON.stringify(list));
      updateList[index] = {
        id: updateList[index].id,
        product: updateList[index].product,
        processing: true,
        user: updateList[index].user
      }
      updateBots[botId - 1] = {
        id: botId,
        name: updateBots[botId - 1].name,
        processing: list[index].id
      };
      setBots(updateBots);
      setList(updateList);
      await callCooking(botId, list[index].id);
    }
  }

  function handleSubmit(e){
    e.preventDefault();
    const order = {
      id: id,
      product: newOrder.product,
      user: newOrder.user
    }
    newOrder.user == "VIP"? setPendingVip([...pendingVip, order]) : setPending([...pending, order]);
    setId(id + 1);
  }

  function handleBotSubmit(e){
    e.preventDefault();
    const bot = {
      id: newBotId,
      name: newBot.name,
    }
    setBots([...bots, bot]);
    setNewBotId(newBotId + 1);
  }

  function handleProductChange(e){
    e.preventDefault();
    setNewOrder({product: e.target.value, user: newOrder.user});
  }

  function handleUserChange(e){
    e.preventDefault();
    setNewOrder({product: newOrder.product, user: e.target.value});
  }

  function handleNameChange(e){
    e.preventDefault();
    setNewBot({name: e.target.value});
  }

  return (
    <div className="App">
      <div>
        <Pending list={[...pendingVip, ...pending]}/>
        <Completed list={completed}/>
        <Bot list={bots}/>
      </div>
      <div className='card'>
        <CreateOrderForm handleSubmit={handleSubmit} handleProductChange={handleProductChange} handleUserChange={handleUserChange}/>
      </div>
      <div className='card'>
        <CreateBotForm handleSubmit={handleBotSubmit} handleNameChange={handleNameChange}/>
      </div>
    </div>
  );
}

function Pending(props){
  const orders = props.list.map((order) => {
    return(
      <tr key={order.id.toString()}>
        <td>{order.id}</td>
        <td>{order.product}</td>
        <td>{order.user}</td>
        <td>{order.processing ? 'Yes' : 'No'}</td>
      </tr>
    )
  })
  return(
  <div>
  <p>Pending</p>
  <table>
    <tr>
      <th>ID</th>
      <th>Product</th>
      <th>User</th>
      <th>Processing</th>
    </tr>
    {orders}
  </table>
  </div>
  )
}

function Completed(props){
  const orders = props.list.map((order) => {
    return(
      <tr key={order.id.toString()}>
        <td>{order.id}</td>
        <td>{order.product}</td>
        <td>{order.user}</td>
      </tr>
    )
  })
  return(
  <div>
  <p>Completed</p>
  <table>
    <tr>
      <th>ID</th>
      <th>Product</th>
      <th>User</th>
    </tr>
    {orders}
  </table>
  </div>
  )
}

function Bot(props){
  const botlist = props.list.map((bot) => {
    return(
    <tr key={bot.id.toString()}>
      <td>{bot.id}</td>
      <td>{bot.name}</td>
      <td>{bot.processing}</td>
    </tr>
    )
  })
  return(
    <div>
    <p>Bots</p>
    <table>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Processing</th>
      </tr>
      {botlist}
    </table>
    </div>
  )
}

function CreateOrderForm(props){

  return(
    <form onSubmit={props.handleSubmit}>
      <div>
      <label for="product">Product: </label>
      <input type="text" id="product" onChange={props.handleProductChange}/>
      </div>
      
      <div>
      <label for="user">User: </label>
      <select id="user" onChange={props.handleUserChange}>
        <option value="Member">Member</option>
        <option value="VIP">VIP</option>
      </select>
      </div>

      <input type="submit" value="Create Order"/>
    </form>
  )
}

function CreateBotForm(props){
  return(
    <form onSubmit={props.handleSubmit}>
      <div>
      <label for="name">Name: </label>
      <input type="text" id="name" onChange={props.handleNameChange}/>
      </div>
      
      <input type="submit" value="Create Bot"/>
    </form>
  )
}

export default App;
