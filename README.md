# carbon's layering model in very little css (AKA: I feel enlightened by container queries)

The layering model differs between the light and dark themes.


In the light themes, layers alternate between White and Gray 10 with each added layer.

In the dark themes, layers become one step lighter with each added layer.

![Layering model for the White theme (left) and Gray 100 theme (right)](https://github.com/bdsqqq/carbon-layering-model-css/assets/37847523/5de953ba-7165-4ca7-85d9-b29a22a7506c)


```css
.layering {
  container-name: layering;
  --depth-is-odd: true;
  display: flex;
}

@container layering style(--depth-is-odd: true) {
  .layering {
    background-color: var(--gray-00);
    --depth-is-odd: false;
  }
}

@container layering style(--depth-is-odd: false) {
  .layering {
    background-color: var(--gray-03);
    --depth-is-odd: true;
  }
}

.dark {
  .layering {
    container-name: layering;
    --depth: 0;
  }

  @container layering style(--depth: 0) {
    .layering {
      background-color: var(--gray-00);
      --depth: 1;
    }
  }

  @container layering style(--depth: 1) {
    .layering {
      background-color: var(--gray-03);
      --depth: 2;
    }
  }

  @container layering style(--depth: 2) {
    .layering {
      background-color: var(--gray-06);
      --depth: 3;
    }
  }
  /* keep going if you want more colors*/
}
```

