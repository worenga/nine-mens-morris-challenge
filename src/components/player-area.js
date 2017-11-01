import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
  props: {
    numberOfWins:
    {
      type: Number,
      required: true
    },

    isThinking:
    {
      type: Boolean,
      required: true
    },

    isActive:
    {
      type: Boolean,
      required: true
    },

    playerName:
    {
      type: String,
      required: true
    },

    selectedAgent:
    {
      type: String,
    },

    availableAgents:
    {
      type: Array,
      required: true
    }
    
  },

  methods: {
    onAgentChange (agent)
    {
      this.$emit('agent-change', agent);
    }
  },

  components: {
    PulseLoader
  }

};
