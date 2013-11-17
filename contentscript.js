//
// Extended Listings for Airbnb
// https://github.com/jrstanley/Extended-Listings-for-Airbnb
// Provides crime data and nearby photos for Airbnb listings
// 

var API_KEYS = {
  FLICKR: '',
  SPOTCRIME: ''
};

var lat = document.querySelector('meta[property="airbedandbreakfast:location:latitude"]').content,
    lon = document.querySelector('meta[property="airbedandbreakfast:location:longitude"]').content,
    apis = [
      {url: 'https://api.spotcrime.com/crimes.json?lat='+lat+'&lon='+lon+'&radius=0.05&key='+API_KEYS['SPOTCRIME'], callback: spotcrime},
      {url: 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key='+API_KEYS['FLICKR']+'&lat='+lat+'&lon='+lon+'&format=json&nojsoncallback=1', callback: flickr}
    ];

function fetchJSON(api) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(data) {
    if (xhr.readyState == 4) api.callback((xhr.status == 200) ? JSON.parse(xhr.responseText) : null);
  };
  xhr.open('GET', api.url, true);
  xhr.send();
}

function createElementWithAttrs(type, attrs, props){
  var attrs = attrs || {}, props = props || {}, ele = document.createElement(type);
  for(a in attrs) ele.setAttribute(a, attrs[a]);
  for(p in props) ele[p] = props[p];
  return ele;
}

function insertMenuItem(div, identifier, title){
  var li = createElementWithAttrs('li', {class: identifier});
  li.appendChild(createElementWithAttrs('a',
    {href: '#'+identifier, 'aria-controls': identifier, class: 'tab-item', 'aria-selected': false, role: 'tab'},
    {innerText: title}
  ));

  var attrs = {id: identifier, class: 'panel-body tab-panel', 'aria-hidden': true, role: 'tabpanel'};
  for(k in attrs) div.setAttribute(k, attrs[k]);

  var main_nav = document.getElementById('main-nav');
  main_nav.parentNode.appendChild(div);
  main_nav.appendChild(li);
}

function spotcrime(data) {
  var crime_div = createElementWithAttrs('div', null,
    {innerHTML: data ? '<p>No recent crime reports found in this area - wahoo!</p>' : '<p>SpotCrime could not be contacted to retrieve crime data at this time.</p>'}
  );

  if (data && data.crimes && data.crimes.length > 0) {
    var crimes = {Other: 0}, keys = [];
    for(var i=0, l=data.crimes.length; i<l; i++){
      if(typeof crimes[data.crimes[i].type] == 'undefined'){
        crimes[data.crimes[i].type] = 0;  
        keys.push(data.crimes[i].type);
      }
      crimes[data.crimes[i].type]++;
    }
    keys.sort();
    keys.push("Other");

    var days_crime_free = Math.floor((Date.now() - Date.parse(data.crimes[0].date))/86400000);
    var last_crime_date = new Date(data.crimes[data.crimes.length-1].date).toDateString();
    crime_div.innerHTML = '<p><strong>No crimes have been reported in this area witin the last ' + days_crime_free + ' days.</strong></p>' + '<p>A total of ' + data.crimes.length + ' reported crimes have been found in this area dating back to ' + last_crime_date + ', which are broken down as follows;</p>';
   
    var crime_list = createElementWithAttrs('ul', {id: 'crime-list', class: 'unstyled button cleafix icon-blue'});
    for(var i=0, l=keys.length; i<l; i++){
      crime_list.appendChild(createElementWithAttrs('li',
        {style: 'text-align:center;display:inline-block;margin-right:20px;'},
        {innerHTML: '<i class="icon text-special" style="font-size: 2em; font-weight: bold;">' + crimes[keys[i]] + '</i><br>' + keys[i]}
      ));
    }
    crime_div.appendChild(crime_list);
  }
  
  crime_div.appendChild(createElementWithAttrs('p', {class: 'text-muted'},
    {innerHTML: 'Crime data provided by <a href="http://www.spotcrime.com">SpotCrime</a>.'}
  ));

  insertMenuItem(crime_div, 'crimes', 'Crime');
}

function flickr(data){
  var html = '';
  if(data && data.photos && data.photos.total > 0){
    for(var i=0, l=Math.min(32, data.photos.photo.length); i<l; i++){
      var p = data.photos.photo[i];
      html += '<a href="http://www.flickr.com/photos/'+p.owner+'/'+p.id+'" target="_blank"><img style="margin: 0 8px 8px 0;" width="145" class="media-photo" src="http://farm'+p.farm+'.staticflickr.com/'+p.server+'/'+p.id+'_'+p.secret+'_q.jpg" alt="'+p.title+'" /></a>';
    }
  } else if (data && data.photos) {
    html = '<p>No nearby photos could be found for this area.</p>';
  } else {
    html = '<p>Flickr could not be contacted to find photos at this time.</p>';
  }
  html += '<p class="text-muted">Photos from <a href="http://www.flickr.com">flickr</a>.</p>';
  insertMenuItem(createElementWithAttrs('div', null, {innerHTML: html}), 'photosnearby', 'Nearby Photos');
}

for(var i=0, l=apis.length; i<l; i++) fetchJSON(apis[i]);