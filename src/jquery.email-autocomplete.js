/*
 *  jQuery Email Autocomplete - v0.0.2
 *  https://github.com/10w042/email-autocomplete
 *  A jQuery plugin that suggests and autocompletes the domain in email fields.
 *  
 *  Some fixes/modifications by Derek Reynolds 8/18/2014
 *
 *  Made by Low Yong Zhen <cephyz@gmail.com>
 *  Under MIT License < http://yzlow.mit-license.org>
 */
"use strict";

(function ($, window, document, undefined) {

  var pluginName = "emailautocomplete";
  var defaults = {
    suggClass: "email-autocomplete-suggestion",
    domains: [ "alltel.net","aol.com", "comcast.net", "embarqmail.com", "gmail.com", "hotmail.com", "msn.com", "nd.edu", "ohio.edu", "osu.edu", "sbcglobal.net", "outlook.com", "verizon.net","vt.edu", "windstream.net", "yahoo.com"]    
  };

  function Plugin(elem, options) {
    this.$field = $(elem);
    this.options = $.extend(true, {}, defaults, options); //we want deep extend
    this._defaults = defaults;
    this._domains = this.options.domains;
    this.init();
  }

  Plugin.prototype = {
    init: function () {

      //shim indexOf
      if (!Array.prototype.indexOf) {
        this.doIndexOf();
      }

      //bind handlers
      this.$field.on("keyup.eac", $.proxy(this.displaySuggestion, this));

      this.$field.on("blur.eac", $.proxy(this.autocomplete, this));
	  
	  this.$field.on("keydown.eac", $.proxy(function (e) {
              //  User hits enter while in field, treat as submit so autocomplete
              if (e.which === 13) {
                  this.autocomplete();
              }
          }, this));

      //get input padding,border and margin to offset text
      this.fieldLeftOffset = (this.$field.outerWidth(true) - this.$field.width()) / 2;

      //wrap our field
      var $wrap = $("<div class='eac-input-wrap' />").css({
        display: this.$field.css("display"),
        position: "relative",
        fontSize: this.$field.css("fontSize")
      });
      this.$field.wrap($wrap);

      //create container to test width of current val
      this.$cval = $("<span class='eac-cval' />").css({
        visibility: "hidden",
        position: "absolute",
        display: "inline-block",
        fontFamily: this.$field.css("fontFamily"),
        fontWeight: this.$field.css("fontWeight"),
        letterSpacing: this.$field.css("letterSpacing")
      }).insertAfter(this.$field);

      //create the suggestion overlay
      /* touchstart jquery 1.7+ */
       // var heightPad = (this.$field.outerHeight(true) - this.$field.height()) / 2  //padding+border
       // DRR 08/19/2014 added 3.5 offset to fine tune position for AEPUtilities
      var heightPad = (this.$field.outerHeight(true) - this.$field.height()) / 2 - 3.5; //padding+border - 3.5 
      this.$suggOverlay = $("<span class='"+this.options.suggClass+"' />").css({
        display: "block",
        "box-sizing": "content-box", //standardize
        lineHeight: this.$field.css('lineHeight'),
        paddingTop: heightPad + "px",
        paddingBottom: heightPad + "px",
        fontFamily: this.$field.css("fontFamily"),
        fontWeight: this.$field.css("fontWeight"),
        letterSpacing: this.$field.css("letterSpacing"),
        position: "absolute",
        top: 0,
        left: 0
      }).insertAfter(this.$field).on("mousedown.eac touchstart.eac", $.proxy(this.autocomplete, this));

    },

    suggest: function (str) {
      var str_arr = str.split("@");
      if (str_arr.length > 1) {
        str = str_arr.pop();
        // DRR 08/18/2014 Altered minimum character length after @ to be 2 characters to trigger suggestion
        //if (!str.length) {
        if (str.length < 2) {
          return "";
        }
      } else {
        return "";
      }
      // DRR 08/19/2014 Added case-insensitive suggestion matching [toLowerCase()]
      var match = this._domains.filter(function (domain) {
        return 0 === domain.indexOf(str.toLowerCase());
      }).shift() || "";

      return match.replace(str.toLowerCase(), "");
    },

    autocomplete: function () {
      if(typeof this.suggestion === "undefined"){
        return false;
      }
      this.$field.val(this.val + this.suggestion);
      this.$suggOverlay.html("");
      this.$cval.html("");

      // DRR 08/18/2014 added fix to call validation after autocomplete https://github.com/10w042/email-autocomplete/issues/4 
      this.$field.validate();
    },

    /**
     * Displays the suggestion, handler for field keyup event
     */
    displaySuggestion: function (e) {
      this.val = this.$field.val();
      this.suggestion = this.suggest(this.val);

      if (!this.suggestion.length) {
        this.$suggOverlay.html("");
      } else {
        e.preventDefault();
      }

      //update with new suggestion
      this.$suggOverlay.html(this.suggestion);
      this.$cval.html(this.val);

      //find width of current input val so we can offset the suggestion text
      var cvalWidth = this.$cval.width();

      if(this.$field.outerWidth() > cvalWidth){
        //offset our suggestion container
        this.$suggOverlay.css('left', this.fieldLeftOffset + cvalWidth + "px");
      }
    },

    /**
     * indexof polyfill
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
    */
    doIndexOf: function(){

        Array.prototype.indexOf = function (searchElement, fromIndex) {
          if ( this === undefined || this === null ) {
            throw new TypeError( '"this" is null or not defined' );
          }

          var length = this.length >>> 0; // Hack to convert object.length to a UInt32

          fromIndex = +fromIndex || 0;

          if (Math.abs(fromIndex) === Infinity) {
            fromIndex = 0;
          }

          if (fromIndex < 0) {
            fromIndex += length;
            if (fromIndex < 0) {
              fromIndex = 0;
            }
          }

          for (;fromIndex < length; fromIndex++) {
            if (this[fromIndex] === searchElement) {
              return fromIndex;
            }
          }

          return -1;
        };
      }
  };

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, "yz_" + pluginName)) {
        $.data(this, "yz_" + pluginName, new Plugin(this, options));
      }
    });
  };

})(jQuery, window, document);

(function ($) {
    $(function () {          
        $("[data-autocomplete-enabled='true']").emailautocomplete();
    });
}(jQuery));