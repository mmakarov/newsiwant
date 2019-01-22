var app = new Vue({
  el: "#app",
  // ================================================
  data: {

    loading: false,
    timer: null,
    totalTime: 0,
    currentItem: 0,
    currentTitle: "",
    currentDetails: "",
    currentLink: "",
    currentImage: "",
    currentDate: "",
    currentHours: "",
    currentMin: "",
    divider: "",
    setIntervalId: null,
    showDivider: true,
    sayTimeout: 0,
    mute: true,
    items: [],
    feed: "https://api.rss2json.com/v1/api.json?rss_url=https://news.yandex.ru/Russia/index.rss"
  },
  // ================================================
  methods: {
    stopTalking() {
      if (!this.mute) {
        speechSynthesis.cancel();
        this.mute = true;
      } else {
        this.mute = false;
      }
    },
    sayText(text) {
      if (!this.mute) {
        // Good to go
        var message = new SpeechSynthesisUtterance(text);
        message.rate = 0.8;
        message.lang = 'ru-RU';
        speechSynthesis.speak(message);
      } else {
        speechSynthesis.cancel();
      }
    },
    updateImage() {

      this.currentImage = 'https://picsum.photos/1600/1200/?image=' + Math.round(Math.random() * 1000);
    },
    updateCurrentTime() {
      clearInterval(this.setIntervalId);

      this.setIntervalId = setInterval(() => {
        this.setCurrentTime();
      }, 1000);

    },
    setCurrentTime() {
      var months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
      var now = new Date();
      var dd = now.getDate();
      if (dd < 10) dd = '0' + dd;
      var mm = now.getMonth();
      mm = months[mm];
      var hh = now.getHours();
      if (hh < 10) hh = '0' + hh;
      var min = now.getMinutes();
      if (min < 10) min = '0' + min;
      var sec = now.getSeconds();
      if (sec < 10) sec = '0' + sec;
      this.currentDate = dd + ' ' + mm;
      this.currentHours = hh;
      this.currentMin = min;

      if (this.showDivider === true) {
        this.divider = ':';
        this.showDivider = false;
      } else {
        this.divider = '';
        this.showDivider = true;
      }
    },
    startTimer: function() {
      this.totalTime = Math.round((
        this.items[this.currentItem].title.length +
        this.items[this.currentItem].content.length) / 11);
      this.timer = setInterval(() => this.countdown(), 1000);
      this.currentTitle = this.items[this.currentItem].title;
      //$document.title = this.currentTitle;
      this.currentLink = this.items[this.currentItem].link;
      this.currentDetails = this.items[this.currentItem].content;
      this.updateImage();
      if (!this.mute) {
        this.sayText(this.currentDetails);
      }

    },
    resetTimer: function() {
      clearInterval(this.timer);
      this.timer = null;
      if (this.currentItem === this.items.length - 1) {
        this.currentItem = 0;
        this.getNews(function(err, data) {
          this.loading = true;
          if (err !== null) {
            console.log('Something went wrong: ' + err);
          } else {
            console.log('Your query count: ' + data.items.length);
            this.app.items = data.items;
          }
          this.loading = false;
        });
      } else this.currentItem++;
      this.startTimer();
    },
    padTime: function(time) {
      return (time < 10 ? '0' : '') + time;
    },
    countdown: function() {
      if (this.totalTime >= 1) {
        this.totalTime--;

      } else {
        this.totalTime = 0;
        this.resetTimer()
      }
    },
    getNews(callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', this.feed, true);
      xhr.responseType = 'json';
      xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
          callback(null, xhr.response);
        } else {
          callback(status, xhr.response);
        }
      };
      xhr.send();
    },
    randomInteger(min, max) {
      var rand = min - 0.5 + Math.random() * (max - min + 1)
      rand = Math.round(rand);
      return rand;
    },
    randomTitle: function() {
      return this.items[randomInteger(1, 9)].title;
    }
  },
  // ================================================
  computed: {
    minutes: function() {
      const minutes = Math.floor(this.totalTime / 60);
      return this.padTime(minutes);
    }

  },
  created: function() {
    this.getNews(function(err, data) {
      this.loading = true;
      if (err !== null) {
        console.log('Something went wrong: ' + err);
      } else {
        console.log('Your query count: ' + data.items.length);
        this.app.items = data.items;
      }

      this.loading = false;

      this.app.startTimer();
    });
    this.updateCurrentTime();
  },
  mounted: function() {

  },
  beforeDestroy() {
    clearInterval(this.setIntervalId);
  }
});