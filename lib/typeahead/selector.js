var React = require('react');
var createClass = require('create-react-class');
var PropTypes = require('prop-types');
var TypeaheadOption = require('./option');
var classNames = require('classnames');
var noop = require('lodash').noop;

/**
 * Container for the options rendered as part of the autocompletion process
 * of the typeahead
 */
var TypeaheadSelector = createClass({
    propTypes: {
        options: PropTypes.array,
        allowCustomValues: PropTypes.number,
        customClasses: PropTypes.object,
        customValue: PropTypes.string,
        selectionIndex: PropTypes.number,
        onOptionSelected: PropTypes.func,
        onCustomOptionChildClick: PropTypes.func,
        customOptionChild: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
        displayOption: PropTypes.func.isRequired,
        defaultClassNames: PropTypes.bool,
        areResultsTruncated: PropTypes.bool,
        resultsTruncatedMessage: PropTypes.string,
        topOption: PropTypes.string,
        showTopOption: PropTypes.bool,
        onTopOptionClick: PropTypes.func
    },

    getDefaultProps: function () {
        return {
            selectionIndex: null,
            customClasses: {},
            allowCustomValues: 0,
            customValue: null,
            onOptionSelected: function (option) {},
            customOptionChild: null,
            onCustomOptionChildClick: () => {},
            defaultClassNames: true,
            topOption: '',
            showTopOption: false,
            onTopOptionClick: noop
        };
    },

    render: function () {
        // Don't render if there are no options to display
        if (!this.props.options.length && this.props.allowCustomValues <= 0 && !this.props.showTopOption) {
            return false;
        }

        var classes = {
            "typeahead-selector": this.props.defaultClassNames
        };
        classes[this.props.customClasses.results] = this.props.customClasses.results;
        var classList = classNames(classes);

        // CustomValue should be added to top of results list with different class name
        var customValue = null;
        var customValueOffset = 0;
        if (this.props.customValue !== null) {
            customValueOffset++;
            customValue = React.createElement(
                TypeaheadOption,
                { ref: this.props.customValue, key: this.props.customValue,
                    hover: this.props.selectionIndex === 0,
                    customClasses: this.props.customClasses,
                    customValue: this.props.customValue,
                    onClick: this._onClick.bind(this, this.props.customValue) },
                this.props.customValue
            );
        }

        var topOptionValue = null;
        if (this.props.showTopOption) {
            customValueOffset++;
            topOptionValue = React.createElement(
                TypeaheadOption,
                { ref: this.props.topOption, key: this.props.topOption,
                    hover: this.props.selectionIndex === customValueOffset,
                    customClasses: this.props.customClasses,
                    onClick: this.props.onTopOptionClick
                },
                this.props.topOption
            );
        }

        var results = this.props.options.map(function (result, i) {
            var displayString = this.props.displayOption(result, i);
            var uniqueKey = displayString + '_' + i;
            return React.createElement(
                TypeaheadOption,
                { ref: uniqueKey, key: uniqueKey,
                    hover: this.props.selectionIndex === i + customValueOffset,
                    customClasses: this.props.customClasses,
                    onClick: this._onClick.bind(this, result),
                    onCustomOptionChildClick: this.props.onCustomOptionChildClick.bind(this, result)
                },
                displayString,
                this.props.customOptionChild
            );
        }, this);

        if (this.props.areResultsTruncated && this.props.resultsTruncatedMessage !== null) {
            var resultsTruncatedClasses = {
                "results-truncated": this.props.defaultClassNames
            };
            resultsTruncatedClasses[this.props.customClasses.resultsTruncated] = this.props.customClasses.resultsTruncated;
            var resultsTruncatedClassList = classNames(resultsTruncatedClasses);

            results.push(React.createElement(
                'li',
                { key: 'results-truncated', className: resultsTruncatedClassList },
                this.props.resultsTruncatedMessage
            ));
        }

        return React.createElement(
            'ul',
            { className: classList },
            topOptionValue,
            customValue,
            results
        );
    },

    _onClick: function (result, event) {
        return this.props.onOptionSelected(result, event);
    }

});

module.exports = TypeaheadSelector;