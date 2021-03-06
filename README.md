#CacheIt
The Team
* Alex Gian 
* Sergio Leon
* Bal Krishna Oli
* Joshua Yuen
* Kristine Nguyen
* 

##Change Log (since hw4)

* Inventory History by updating an array for each type of metal when delete, updating, add
* Multiple Login is properly implemented now. All coins should be private to the user.
* Tweaked Login attempt message
* Reset Password Impelemented. Will send recover email.
* Ran out of time for minification, Gulp is only used to launch a development server at the moment
* Discovered a bug with calcuating scale for the graph. Now it properly finds the min and max and scales approriately.



##Project Structure
```
package.js                 -- Dev. Packages (gulp, gulp-live-server)
bower.js                   -- Install file for front end packages
README.md                  -- This file
gulpfile.js                -- Build Automation with development server, later 
                              it will have optimization and packaging tools
style/                     -- CSS
sass/                      -- Other styling
fonts/                     -- Fonts
assets/                    -- Images and other media
bower_components/          -- External Libraries
js/                        -- Scripts
view/                      -- HTML Views
   index.html              -- Front page with signup and login buttons
   login.html              -- Login page
   signup.html             -- Signup page
   wire2.html              -- Home page with all metal info
   wire3.html              -- Specific metal info page
   wire4.html              -- View Item Details page
   wire5.html              -- Add Item Details page
   updateitem.html         -- Edit/update Item page
```
## Design decisions
**Reworked CSS**

We thought the theme was a bit dark, so we brighten things up with our own colors.

**Routing for wire3**

We used the `hash` in the url specifically for wire3.html because there was no other way to differentiate a page between what metal was selected and it would be problematic to copy and paste 3 versions of wire3.html just for each metal. So we uses `window.location.hash` to get the hash to determine what metal page it is refering to.
We also used this in other pages that require redirect back to wire3.html like wire4 and wire5 which return back to the metal page.

**Backend Web Parse**

For a proper database for what we need we though that Parse was a good fit. 

**NodeJS Scrapper using RESTIFY and Cheerio**

Since there were no free options to obtain bid, and ask data. We decided to implement a scrapper that we deployed on Heroku to gather data from JMBullion. 
This was achieved by accessing JMBullion's third party service that provides them with data and we created a JS Dom using Cheerio. We access a attribute which contained a JSON string and parsed that out. To establish our own rest API and creating a client to JMBullion site, we used we used was RESTIFY a lightweight REST framework meant only for creating REST endpoints. Since Express is overkill this was a good decision, as it is also easy to use.

**Other Decisions and Technologies**
* Zingchart - for it's customizability and other features
* Promise.js - 1k sized promise library to optimize request by allowing them to be sent in parallel
* Cookie.js - under 1k library to handle cookies easier
* underscore.js - Useful algorithm used in wire5 for find, sorting, extracting data
* purecss - around 4k css framework - mostly for the login and signup to quickly design it, may change later on.
* gulp - for build automation, at the moment it only deploys a development server with auto reload, later we'll have optmization like concat, uglify, and rename for better cacheing

##Specific Feature Details 
###main.js
Converted all Jquery into raw javascript

###cacheit.js
A work in progress utility library as we refactor our reusable. 

Initialize library by calling 
```
var Cache = CacheIt(appId, apiKey);
```
appid is the Application Id provided by Parse
appkey is the API Key provided by Parse

* `Cacheit.initTimer(cb);`
   * starts the timer and wait until resetTimer() is called
when resetTimer() is called the callback `cb` is invoked after a set delay
* `Cacheit.resetTimer();`
   * resets the clock and invokes initTimer’s callback after a set delay
* `Cacheit.stopTimer();`
   * stop the timer completely and disable the cb from being invoked
* `formatTime()`
   * returns time as yyyy-mm-dd with padded zeros if there day or month is a single digit
   * ex. 2015-01-01 - 0s are added in front of the 1s
* `toggleClass(id, className1, className2, value, postfix)`
   * given an id and two classes it applies css the value along with a postfix
   * id - html id
   * className1 - class to choose if `value` is positive
   * className2 - class to choose if `value` is negative
   * value - the number to append to the id and used to determine which class is applied to it
   * postfix - a string that is appended to the value for formatting like a % symbol
* `getClass(id, className, option, callback)`
   * a wrapper that that makes a `GET` requests to parsesweb service
   * can return a single object or an array depending on the configurations passed in
   * `classname` - Parse class name
   * (optional) `options` can be: sessionToken, query
   * (optional) `callback(foundObject,errorMessage)` - the callback receives 2 parameters the object that's found and the error message if something went wrong
   * also returns a promise allowing the requests to be chained executed sequentially with other promises or joined to run in parallel
* `delete(objectId, metal, weight, sessionToken, callback)`
* `getMarketPrice(callback)` - returns the market price from our heroku endpoint at cse134b.herokuapp.com
* `chartDown`- generates a JSON to render on zingchart if something went wrong
* `getMetalPrice(metal, start, end, callback)` - returns the marketprice from Quandl given the metal type, start and end data

index.html
Not much changed here

###login.html
Embedded script tag with js logic for login because we believe it didn’t warrant a separate page see how small simple the page was.
Using vanilla js to handle AJAX style requests 
Hit’s Parse’s login api at https://api.parse.com/1/login which returns a session token which we set in a cookie
A very tiny cookie library at 1k is used to handle the cookie setting and getting
Library here: https://github.com/js-coder/cookie.js

###signup.html
Similar to login.html, embedded script tag with js logic for signing up
Using vanilla js to handle AJAX style requests 
Sign up hits Parse’s signup api at https://api.parse.com/1/users 
Redirects to Home page with metal info without the need to go to login for convenience as a session token is returned at signup similar to login which is set in a cookie

###wire2.html | wire2.js | wire2.chart.js
**Home page**
* Get live data from parse where it is stored including daily changes from the market
* Have functions to get total of all metals, and bid/ask/changes of each metal from parse
* Use getElementById to connect javascript with html by the ids
* updateTime function to update open/close market operations, which getOffset is -4 standing for Eastern time zone/ New York Stock Exchange hours
* implement the chart from zingchart where values are called from Parse and set into x,y-axis as a chart
* Inside wire2.chart.js prepare data of all metals for the chart to display
   * using function getAxis() in cacheit.js to fill in gaps in data and optimize it
   * Getting the chart right was posbilty the most time consuming aspect of this page.
   * The chart did not like it if some datas are missing so we had to make sure all the dates are filled in using getAxis()
   * As well as the labels being in sync with the data
* Using promise library to optimize load time by parallelizing async requests to Quandl using the method getMetalPrice()

###wire3.html | wire3.js | wire3.chart.js
**Specific Metal Info**
* Refactored many methods that are used through out the app into `js/cacheit.js`
* Added loading bars to search bar, table loading, and ask, bid and change price panel.
* Search bar using a `onkeyup` combined with `setTimeout` to detect that the user has finished typing without HTTP requests being fire off every time the user lifts their finger. This prevents a bombardment of requests to parse
* Designed custom library to handle the above action using methods in `cacheit.js`
   * `initTimer(cb)`, `resetTimer()`
* Similar to wire2.chart.js, wire3.chart.js prepares data for a specific metal
   * also uses getAxis()
   * Handles Quandl server issue or network issues with `Cachit.chartDown` which displays an error message.
   * Same difficulties were had here as well with data syncronization
* Added View link if any elements are click except for the edit and delete buttons of course.
  * And eventListener is listen for the click and assigns the objectId for the coin in a cookie to be used in `wire4.html`
* Edit, and Delete button 
  * Similar to view using a combination of the query string, hash, and cookie 

###wire4.html | wire4.js
**View Item Detail**
* Get and display coin picture from Parse 
* Get and display coin metal, type, weight, premium, market price, fineness, weight/unit (ozt) from Parse 
* Calculate and display total from aforementioned fields


###wire5.html | wire5.js

**Add item**
* Get data from parse by the metal,type,quantity and premium.
* Have function to update coin info as input changes.
* Calculated the  data received from parse and displayed in the page.
* Upload Image and the detail info of the coin back to parse.
* Have ajax function to associate image and coin info with the class in parse.
* Error Message if user forgets to add image
* 

###updateitem.js | wire5.js

**Edit item**
* Reuses `wire5.js` with the query string `?action=edit`
* ex. http://localhost:3000/view/updateitem.html?action=edit#platinum
