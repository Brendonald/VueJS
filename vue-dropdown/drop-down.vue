<template>
  <div class="drop-down" v-bind:class="{expanded: isExpanded}">
    <div class="toggle-area" v-on:click="toggleOptions" :class="{focused: isExpanded, expanded: isExpanded, error: hasError}">
      <input v-bind:placeholder="placeholder" v-model=model.value v-on:keyup="handleKeyUp($event)">
      <i class="icon fa fa-angle-right" :class="{rotateup: isExpanded}"></i>
    </div>
    <div class="drop-down-options" :class="{expanded: isExpanded}">
      <div class="drop-down-option" v-for="option in optionsObjects" :class="{hidden: option.isHidden, highlighted: option.isHighlighted}" v-on:click="selectOption(option)">
        {{option.value}}
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
      // this should not be needed ! isHighlighted toggles the class properly, isHidden does not until next rerender... BONKERS
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
      this.$parent.dropdownValueUpdated(this.model, option.value);
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
}
</script>

<style lang="scss" scoped>

	.drop-down {
		position: relative;
		width: 100%;
		height: 30px;
		line-height: 30px;
		
		&.expanded {
		  border-radius: 3px 3px 0 0;
		  border-color: #40DA4A;
			box-shadow: 0 0 3px 2px #D8F8DA;
		}

		.toggle-area {
		  width: 100%;
		  height: 100%;
		  border: solid 1px #999999;
		  border-radius: 3px;
		  box-sizing: border-box;
		  display: flex;
		  cursor: pointer;
		  overflow: hidden;
		  background-color: white;

		  &.error {
		    border-bottom-color: red;
		  }

		  &.focused {
		    border-color: #40DA4A;
		    border-radius: 3px 3px 0 0;
				box-shadow: 0 0 3px #D8F8DA;
		    border-bottom: none;
		  }

		  input {
		    height: 100%;
		    width: 75%;
		    border: none;
		    padding-left: 2px;
		    font-size: 1em;
		    flex-grow: 1;
		    background-color: transparent;
		    outline: none;
		  }

		  i {
		    flex-shrink: 0;
		    width: 30px;
		    line-height: 30px;
		    font-size: 1.5em;
		    text-align: center;
		    transform: rotate(90deg);
		    transition: all 250ms ease;

		    &.rotateup {
		      transform: rotate(270deg);
		    }
		  }
		}

		.drop-down-options {
		  position: absolute;
		  z-index: 1;
		  width: 99%;
		  height: 0px;
		  border: none;
		  transition: all 200ms;
		  overflow: auto;
		  background: white;

		  &.expanded {
		    height: 200px;
		    max-height: 200px;
		    box-shadow: 0 3px 3px 2px #D8F8DA;
		    border: solid 1px #40DA4A;
		    border-top: none;
		    border-radius: 0 0 3px 3px;
		  }

		  .drop-down-option {
		    cursor: pointer;
		    padding-left: 10px;

		    &.hidden {
		      display: none;
		    }

		    &:hover, &.highlighted {
		      background-color: #D8F8DA;
		    }
		  }
		}
	}
</style>

