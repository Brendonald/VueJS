Vue.extend({
  template: `<div class="drop-down" :class="{expanded: isExpanded}">
    <div class="toggle-area" v-on:click="toggleOptions" :class="{focused: isExpanded, expanded: isExpanded, error: hasError}">
      <input :placeholder="placeholder" v-model=model.value v-on:keyup="handleKeyUp($event)">
      <i class="icon fa fa-angle-right" :class="{rotateup: isExpanded}"></i>
    </div>
    <div class="drop-down-options" :class="{expanded: isExpanded}">
      <div class="drop-down-option" v-for="option in optionsObjects" :class="{hidden: option.isHidden, highlighted: option.isHighlighted}" v-on:click="selectOption(option)">
        {{option.value}}
      </div>
    </div>
  </div>`,
  props: ['model', 'placeholder', 'resetValue', 'hasError'],
  data () {
    return {
      isSearchable: undefined,
      isExpanded: false,
      clickBound: false,
      highlightedIndex: undefined,
      clickEventNamespace: undefined,
      isKeyNavigating: false,
    }
  },
  computed: {
    optionsObjects () {
      let optionsArray = [];
      this.model.options.forEach( option => {
        let optionObject = {
          value: option,
          isHidden: undefined,
          isHighlighted: undefined
        }
        optionsArray.push(optionObject);
      });
      return optionsArray;
    }
  },
  methods: {
    toggleOptions () {
      if (!this.isExpanded) {
        this.initOptions();
        this.bindDocumentClick(true);
      }
    },
    initOptions () {
      if (this.highlightedIndex !== undefined) {
        this.optionsObjects.forEach( (option, index) => {
          if (index === this.highlightedIndex) {
            option.isHighlighted = true;
            this.highlightedIndex = index;
          }
          else {
            option.isHighlighted = false;
          }
        });
      }
      else {
        this.highlightedIndex = 0;
        this.optionsObjects[this.highlightedIndex].isHighlighted = true;
      }
    },
    handleKeyUp (evt) {
      if (evt.keyCode === 38 || evt.keyCode === 40) {
        this.handleKeyNavigation(evt.keyCode);
      }
      else if (evt.keyCode === 13) {
        this.selectOption(this.optionsObjects[this.highlightedIndex]);
        // if enter key is pressed, collapse dropdown and unbind click event from document.
        this.isExpanded = false;
        this.clickBound = false;
        $(document).unbind(this.clickEventNamespace);
      }
      else {
        this.updateOptions();
      }
    },
    handleKeyNavigation (keyCode) {
      if (keyCode === 38) {
        for (let i=this.highlightedIndex-1; i>=0; i--) {
          let option = this.optionsObjects[i];
          if (!option.isHidden) {
            this.optionsObjects[this.highlightedIndex].isHighlighted = false;
            this.highlightedIndex = i;
            option.isHighlighted = true;
            this.model.value = option.value;
            break;
          }
        }
      }
      else if (keyCode === 40) {
        for (let i=this.highlightedIndex+1; i<this.optionsObjects.length; i++) {
          let option = this.optionsObjects[i];
          if (!option.isHidden) {
            this.optionsObjects[this.highlightedIndex].isHighlighted = false;
            this.highlightedIndex = i;
            option.isHighlighted = true;
            this.model.value = option.value;
            break;
          }
        }
      }
    },
    updateOptions () {
      this.optionsObjects.forEach( option => {
        if (this.model.value && option.value.indexOf(this.model.value) !== 0) {
          option.isHidden = true;
        }
        else {
          option.isHidden = false;
        }
      });
      // this should not be needed ! toggle class works during keyboard navigation, but not here. 
      this.$forceUpdate();
    },
    bindDocumentClick (preventRemove) {
      var self = this;
      if (preventRemove) {
        this.clickEventNamespace = "click.dropdown" + Date.now();
        $(document).on(this.clickEventNamespace, function(evt) {
          self.isExpanded = !self.isExpanded;
          if (preventRemove) {
            preventRemove = false;
          }
          else {
            $(document).off(self.clickEventNamespace);
          }
        });
      }
    },
    selectOption (option) {
      this.highlightedIndex = this.optionsObjects.indexOf(option);
      this.model.value = option.value;
      // notify parent that the value has been updated.
      // this.$parent.dropdownValueUpdated(this.model, option.value);
    },
    resetValueIfInvalid () {
      if (this.model.value) {
        var formattedInput = this.model.value.charAt(0).toUpperCase() + this.model.value.substr(1);
        if (this.model.options.indexOf(formattedInput) === -1) {
          this.model.value = "";
        }
        else {
          this.model.value = formattedInput;
        }
      }
    }
  }
});
