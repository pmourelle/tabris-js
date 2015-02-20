describe("PropertyEncoding:", function() {

  var consoleBackup = window.console;

  beforeEach(function() {
    window.console = jasmine.createSpyObj("console", ["log", "info", "warn", "error"]);
  });

  afterEach(function() {
    window.console = consoleBackup;
  });

  describe("layoutData", function() {

    it("calls tabris.Layout.checkLayoutData", function() {
      var inValue = {};
      var outValue = {};
      spyOn(tabris.Layout, "checkLayoutData").and.returnValue(outValue);

      var result = tabris.PropertyEncoding.layoutData(inValue);

      expect(tabris.Layout.checkLayoutData).toHaveBeenCalledWith(inValue);
      expect(result).toBe(outValue);
    });

  });

  describe("image", function() {

    var check = tabris.PropertyEncoding.image;

    it("succeeds for minimal image value", function() {
      var result = check({src: "foo.png"});

      expect(result).toEqual(["foo.png", null, null, null]);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("succeeds for image with width and height", function() {
      var result = check({src: "foo.png", width: 10, height: 10});

      expect(result).toEqual(["foo.png", 10, 10, null]);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("succeeds for string", function() {
      expect(check("foo.jpg")).toEqual(["foo.jpg", null, null, null]);
    });

    it("fails if image value is null", function() {
      expect(function() {
        check(null);
      }).toThrow(new Error("Not an image: null"));
    });

    it("fails if image value is not an object", function() {
      expect(function() {
        check(23);
      }).toThrow(new Error("Not an image: 23"));
    });

    it("fails if src is undefined", function() {
      expect(function() {
        check({});
      }).toThrow(new Error("image.src is not a string"));
    });

    it("fails if src is empty string", function() {
      expect(function() {
        check({src: ""});
      }).toThrow(new Error("image.src is an empty string"));
    });

    it("fails if width/height/scale values are invalid number", function() {
      var goodValues = [0, 1, 1 / 3, 0.5, Math.PI];
      var badValues = [-1, NaN, 1 / 0, -1 / 0, "1", true, false, {}];
      var props = ["width", "height", "scale"];
      var checkWith = function(prop, value) {
        var image = {src: "foo"};
        image[prop] = value;
        check(image);
      };

      props.forEach(function(prop) {
        goodValues.forEach(function(value) {
          expect(function() { checkWith(prop, value); }).not.toThrow();
        });
        badValues.forEach(function(value) {
          var error = new Error("image." + prop + " is not a dimension: " + value);
          expect(function() { checkWith(prop, value); }).toThrow(error);
        });
      });
    });

    it("warns if scale and width are given", function() {
      check({src: "foo.png", width: 23, scale: 2});

      var warning = "Image scale is ignored if width or height are given";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("warns if scale and height are given", function() {
      check({src: "foo.png", height: 23, scale: 2});

      var warning = "Image scale is ignored if width or height are given";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

  });

  describe("boolean", function() {

    var check = tabris.PropertyEncoding.boolean;

    it("passes through true", function() {
      expect(check(true)).toBe(true);
    });

    it("passes through false", function() {
      expect(check(false)).toBe(false);
    });

    it("translates falsy values", function() {
      expect(check(null)).toBe(false);
      expect(check("")).toBe(false);
      expect(check(undefined)).toBe(false);
      expect(check(0)).toBe(false);
    });

    it("translates truthy values", function() {
      expect(check(1)).toBe(true);
      expect(check({})).toBe(true);
      expect(check("true")).toBe(true);
      expect(check("false")).toBe(true);
    });

  });

  describe("string", function() {

    var check = tabris.PropertyEncoding.string;

    it("translates any value to string", function() {
      expect(check("str")).toBe("str");
      expect(check(23)).toBe("23");
      expect(check(false)).toBe("false");
      expect(check(null)).toBe("null");
      expect(check(undefined)).toBe("undefined");
      expect(check({})).toBe("[object Object]");
      expect(check([1, 2, 3])).toBe("1,2,3");
      expect(check({toString: function() {return "foo";}})).toBe("foo");
    });

  });

  describe("natural", function() {

    var check = tabris.PropertyEncoding.natural;

    it("fails for non-numbers", function() {
      var values = ["", "foo", "23", null, undefined, true, false, {}, []];
      values.forEach(function(value) {
        expect(function() {
          check(value);
        }).toThrow(new Error(typeof value + " is not a number: " + value));
      });
    });

    it("fails for invalid numbers", function() {
      var values = [NaN, 1 / 0, -1 / 0];
      values.forEach(function(value) {
        expect(function() {
          check(value);
        }).toThrow(new Error("Number is not a valid value: " + value));
      });
    });

    it("accepts natural number including zero", function() {
      expect(check(0)).toBe(0);
      expect(check(1)).toBe(1);
      expect(check(10e10)).toBe(10e10);
    });

    it("normalizes negative values", function() {
      expect(check(-1)).toBe(0);
      expect(check(-1.5)).toBe(0);
    });

    it("rounds given value", function() {
      expect(check(0.4)).toBe(0);
      expect(check(1.1)).toBe(1);
      expect(check(1.9)).toBe(2);
    });

  });

  describe("integer", function() {

    var check = tabris.PropertyEncoding.integer;

    it("fails for non-numbers", function() {
      var values = ["", "foo", "23", null, undefined, true, false, {}, []];
      values.forEach(function(value) {
        expect(function() {
          check(value);
        }).toThrow(new Error(typeof value + " is not a number: " + value));
      });
    });

    it("fails for invalid numbers", function() {
      var values = [NaN, 1 / 0, -1 / 0];
      values.forEach(function(value) {
        expect(function() {
          check(value);
        }).toThrow(new Error("Number is not a valid value: " + value));
      });
    });

    it("accepts positive and negative numbers including zero", function() {
      expect(check(-(10e10))).toBe(-(10e10));
      expect(check(-1)).toBe(-1);
      expect(check(0)).toBe(0);
      expect(check(1)).toBe(1);
      expect(check(10e10)).toBe(10e10);
    });

    it("rounds given value", function() {
      expect(check(-1.9)).toBe(-2);
      expect(check(-1.1)).toBe(-1);
      expect(check(-0.4)).toBe(0);
      expect(check(0.4)).toBe(0);
      expect(check(1.1)).toBe(1);
      expect(check(1.9)).toBe(2);
    });

  });

  describe("choice", function() {

    var check = tabris.PropertyEncoding.choice;

    it("allows string values given in array", function() {
      var accepted = ["1", "foo", "bar"];

      expect(check("1", accepted)).toBe("1");
      expect(check("foo", accepted)).toBe("foo");
      expect(check("bar", accepted)).toBe("bar");
    });

    it("rejects string values not given in array", function() {
      var accepted = ["x", "y", "z"];

      ["1", "foo", "bar"].forEach(function(value) {
        expect(function() {
          check(value, accepted);
        }).toThrow(new Error("Accepting \"x\", \"y\", \"z\", given was: \"" + value + "\""));
      });
    });

    it("translates values given in map", function() {
      expect(check("1", {1: "2", 3: "4"})).toBe("2");
      expect(check("3", {1: "2", 3: "4"})).toBe("4");
    });

    it("rejects string values not given in map", function() {
      var accepted = {x: true, y: true, z: true};

      ["1", "foo", "bar"].forEach(function(value) {
        expect(function() {
          check(value, accepted);
        }).toThrow(new Error("Accepting \"x\", \"y\", \"z\", given was: \"" + value + "\""));
      });
    });

  });

  describe("nullable", function() {

    var check = tabris.PropertyEncoding.nullable;

    it("allows null", function() {
      expect(check(null)).toBeNull();
    });

    it("allows null or alternate check", function() {
      expect(check(null, "natural")).toBeNull();
      expect(check(1.1, "natural")).toBe(1);
    });

    it("rejects alternate check", function() {
      expect(function() {
        check(NaN, "natural");
      }).toThrow();
    });

  });

});
